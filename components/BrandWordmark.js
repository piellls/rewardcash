// The BlueberryCash logo (blueberry + name). Its height is set in globals.css (.brand-logo) and the width follows,
// so it can be sized per screen in one place. width/height here only reserve the space while it loads.
export default function BrandWordmark() {
  return <img src="/brand/blueberrycash-logo.png" alt="BlueberryCash" width="640" height="167" className="brand-logo" decoding="async" />;
}
