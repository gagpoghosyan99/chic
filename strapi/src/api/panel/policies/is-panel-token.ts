export default (policyContext) => {
  const auth = policyContext.state?.auth;
  return auth?.strategy?.name === 'api-token' && auth?.credentials?.type === 'full-access';
};
