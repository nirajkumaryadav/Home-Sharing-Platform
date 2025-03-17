// Look for and modify any automatic redirects to dashboard

// Change this:
useEffect(() => {
  if (user) {
    history.push('/dashboard');
  }
}, [user, history]);

// To this:
useEffect(() => {
  // Only redirect if explicitly navigating from login/register
  if (user && location.pathname.match(/\/(login|register)$/)) {
    const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
    history.push(redirectPath);
  }
}, [user, history, location]);