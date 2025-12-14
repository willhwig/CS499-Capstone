// authorizer.js
exports.authorize = async (event) => {

  const token = event.headers['x-api-key'];
  const expectedToken = process.env.AUTH_TOKEN;


  if (token === expectedToken) {
    const policy = {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.routeArn || '*'
          }
        ]
      },
      context: {
        user: 'trusted-client'
      }
    };
    return policy;
  } else {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.routeArn || '*'
          }
        ]
      },
      context: {
        user: 'unauthorized'
      }
    };
  }
};

