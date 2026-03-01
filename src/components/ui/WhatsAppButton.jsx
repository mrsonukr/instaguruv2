const WhatsAppButton = ({ className = "", children = "Contact Us" }) => {

  const handleClick = (e) => {
    e.preventDefault();

    window.open(
      "https://tawk.to/chat/69a45b6ef376451c37353af2/1jil0aaku",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <a
      href="https://tawk.to/chat/69a45b6ef376451c37353af2/1jil0aaku"
      target="_blank"
      rel="noopener noreferrer"
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