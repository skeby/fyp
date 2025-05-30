const UserProfile = async ({
  params,
}: {
  params?: Promise<{ username: string }>;
}) => {
  const username = (await params)?.username;
  return <div>Username: {username}</div>;
};

export default UserProfile;
