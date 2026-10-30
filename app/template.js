// A template re-mounts on every navigation, so each page fades in with the small .g-page animation.
export default function Template({ children }) {
  return <div className="g-page">{children}</div>;
}
