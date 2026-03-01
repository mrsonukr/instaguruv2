const WhatsAppButton = ({ className = "", children = "Contact Us" }) => {

  const handleClick = (e) => {
    e.preventDefault();

    // Same tab redirect
    window.location.href = "https://support.smmguru.shop/";
  };

  return (
    <a
      href="https://support.smmguru.shop/"
      onClick={handleClick}
      className={className}
      role="button"
      tabIndex={0}
    >
      {children}
    </a>
  );
};

export default WhatsAppButton;