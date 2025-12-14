// ganttBuilder.js
const { parseISO, format, addDays, eachDayOfInterval, isWeekend, min, max } = require('date-fns');


/* ── helpers that don’t depend on “tasks” ─────────────────── */

const getTimelineRange = (tasks) => {
  const startDates = tasks.map(t => parseISO(t['Start Date']));
  const endDates = tasks.map(t => parseISO(t['End Date']));
  const fullRange = eachDayOfInterval({
    start: addDays(min(startDates), -3),
    end: addDays(max(endDates), 3),
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return fullRange.filter((d, i) =>
    i % 2 === 0 || format(d, 'yyyy-MM-dd') === todayStr
  );
};



const generateColGroup = range =>
    '<colgroup>' +
    `<col style="width: var(--col-component-width);">` +
    `<col style="width: var(--col-warning-width);">` +
    range.map(() => '<col style="width: 20px;">').join('') +
    '</colgroup>';

const generateMonthHeader = range => {
    let html = '', current = format(range[0], 'MMMM yyyy'), span = 0;
    range.forEach((d, i) => {
        const m = format(d, 'MMMM yyyy');
        if (m === current) span++;
        else {
            html += `<th colspan="${span}" class="month-header">${current}</th>`;
            current = m; span = 1;
        }
        if (i === range.length - 1)
            html += `<th colspan="${span}" class="month-header">${current}</th>`;
    });
    return html;
};

const today = new Date();

const generateDayHeader = (range, today) =>
  range.map(d => {
    const isToday = format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    return `<th class="day-header ${isWeekend(d) ? 'weekend' : ''} ${isToday ? 'today-col' : ''}">${format(d, 'dd')}</th>`;
  }).join('');

/* ── MAIN entry point ─────────────────────────────────────── */

exports.buildHTML = function buildHTML(tasksRaw = []) {

    /* 1. sort ------------------------------------------------- */
    const tasks = [...tasksRaw];             // don’t mutate caller’s array
    const earliestAc = {};
    const earliestMro = {};
    const today = new Date();

    tasks.forEach(t => {
        const end = new Date(t['End Date']);
        if (!earliestAc[t.Aircraft] || end < earliestAc[t.Aircraft]) earliestAc[t.Aircraft] = end;
        if (!earliestMro[t.MRO] || end < earliestMro[t.MRO]) earliestMro[t.MRO] = end;
    });

    tasks.sort((a, b) => {
        const mroDiff = earliestMro[a.MRO] - earliestMro[b.MRO];
        if (mroDiff) return mroDiff;
        const acDiff = earliestAc[a.Aircraft] - earliestAc[b.Aircraft];
        if (acDiff) return acDiff;
        return new Date(a['End Date']) - new Date(b['End Date']);
    });

    /* 2. body rows ------------------------------------------- */
    const range = getTimelineRange(tasks);
    let body = '', lastMro = '', lastAc = '';

    for (const t of tasks) {
        const { MRO, Aircraft, 'Component Group': grp, Warning, 'Start Date': s, 'End Date': e } = t;
        const start = parseISO(s), end = parseISO(e), pct = +t.PercentComplete || 0;
        const warnClass = Warning === 'Work Stoppage'
            ? 'warning-critical'
            : Warning && Warning !== 'N/A' ? 'warning-caution' : '';

        if (MRO !== lastMro) {
            if (lastMro) body += `<tr class="mro-spacer"><td colspan="100"></td></tr>`;
            body += `<tr class="mro-header"><td colspan="100">${MRO}</td></tr>`;
            lastMro = MRO; lastAc = '';
        }
        if (Aircraft !== lastAc) {
            body += `<tr class="ac-header"><td colspan="100">${Aircraft}</td></tr>`;
            lastAc = Aircraft;
        }

        body += `<tr class="task-row"><td class="component-cell">${grp}</td><td class="${warnClass}">${Warning || 'N/A'}</td>`;
        let placed = false;


        for (let i = 0; i < range.length; i++) {
        const d = range[i];
        const isToday = format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');


        if (!placed && d >= start && d <= end) {
        const span = range.filter(dt => dt >= start && dt <= end).length;
        const todayStr = format(today, 'yyyy-MM-dd');
        const taskDates = range.slice(i, i + span).map(dt => format(dt, 'yyyy-MM-dd'));

        body += `
        <td class="fill-cell" colspan="${span}">
            <div class="track-bar ${warnClass}">
            <div class="completion-bar${pct >= 1 ? ' complete' : ''}" style="width:${Math.floor(pct * 100)}%"></div>
            <span class="percent-label" data-text="${(pct * 100).toFixed(1)}%"></span>
            </div>
        </td>`;
        i += span - 1;
        placed = true;
        } else {
            body += `<td class="${isToday ? 'today-col' : ''}"></td>`;
        }
        }
        body += '</tr>';
    }

    /* 3. glue everything together ----------------------------- */
    return `
<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Gantt</title>
<style>
  :root {
    --col-component-width: 150px;
    --col-warning-width: 150px;
  }
  body {
    font-family: sans-serif;
    font-size: 13px;
    margin: 0;
    overflow-x: auto;
  }
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: max-content;
    table-layout: fixed;
  }
  th, td {
    padding: 4px;
    border: 1px solid #ccc;
  }
  th {
    background: #f3f3f3;
  }
  .day-header {
    width: 30px;
    font-size: 10px;
    font-weight: bold;
    text-align: left;
    padding-left: 4px;
  }
  .weekend {
    background: #eaeaea;
  }
  thead th {
    position: sticky;
    top: 0;
    z-index: 3;
  }
  th:nth-child(1), td:nth-child(1) {
    position: sticky;
    left: 0;
    width: var(--col-component-width);
    background: #fff;
    z-index: 2;
    border-right: 2px solid #ccc;
  }
  th:nth-child(2), td:nth-child(2) {
    position: sticky;
    left: var(--col-component-width);
    width: var(--col-warning-width);
    background: #fff;
    z-index: 2;
  }
  .mro-header td {
    font-size: 16px;
    font-weight: bold;
    background: #f9f9f9;
    padding-top: 10px;
    border: none;
  }
  .ac-header td {
    font-size: 15px;
    font-weight: bold;
    background: #f5f5f5;
    padding-left: 12px;
    border: none;
  }
  .task-row td {
    font-size: 14px;
    border-top: none;
    border-bottom: 1px solid #ccc;
    height: 36px; /* increased row height */
  }
  .component-cell {
    padding-left: 24px;
  }
  .fill-cell {
    padding: 0;
    border: none;
  }
  .track-bar {
    position: relative;
    height: 26px; /* increased bar height */
    width: 100%;
    background: var(--track-bg, #ccc);
    margin: 2px 0;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(160,160,160,.9);
  }
  .completion-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #007bff;
  }
  .completion-bar.complete {
    background: #28a745;
  }
  .percent-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 11px;
    color: #fff;
    pointer-events: none;
  }
  .percent-label::before {
    content: attr(data-text);
    background: rgba(0,0,0,.3);
    padding: 2px 6px;
    border-radius: 4px;
    height: 50%;
    display: flex;
    align-items: center;
  }
  td.warning-caution {
    color: #a37c00;
    font-weight: bold;
    background: #fff8dc;
  }
  td.warning-critical {
    color: #b30000;
    font-weight: bold;
    background: #f8d7da;
  }
  .track-bar.warning-caution {
    --track-bg: rgb(202,159,18);
  }
  .track-bar.warning-critical {
    --track-bg: #b30000;
  }
  .mro-spacer td {
    height: 10px;
    border: none;
    background: transparent;
  }
  .today-col {
    border-left: 3px dashed black !important;
    background-color: rgba(0, 0, 0, 0.03);
    }
</style>

</head><body>
<table>
  ${generateColGroup(range)}
  <thead>
    <tr><th></th><th></th>${generateMonthHeader(range)}</tr>
    <tr><th>Component</th><th>Notes</th>${generateDayHeader(range, today)}</tr>
  </thead>
  <tbody>${body}</tbody>
</table>
</body></html>`;
}


