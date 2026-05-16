declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      _user: any;
      _session: any;
    }
  }
}

export default defineGuard(async ({ request }) => {
  let token = request.headers['authorization'];
  if (!token) return;

  [, token] = token.split(' ');

  const verify = useService('jwt.verify');
  const { sessionID } = await verify(token);

  const model = getModel('Session');
  const session = await model.findById(sessionID);

  if (!session || session?.close) {
    return {
      pass: false,
      errorMessage: 'session.errors.not_authorized',
      user_required: true,
    };
  }

  const userModel = getModel('User');
  const user = await userModel
    .findById(session.userID.toString())
    .lean()
    .exec();

  request._user = user;
  request._session = session;
});
