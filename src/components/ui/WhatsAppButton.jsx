const greetings = [
  "Hello Sir",
  "Hi Sir, I need support",
  "Hello, I want to know about your services",
  "Hi, please guide me",
  "Hello, I want to place an order",
  "Hi Sir, I have a query",
  "Hello, I visited your website",
  "Hi, I am interested in your service",

  "Hello, I need some information",
  "Hi, can you please share the details?",
  "Hello, I want to discuss my requirement",
  "Hi, please help me with this",
  "Hello, I have a question regarding your service",
  "Hi, I am looking for more information",
  "Hello, I would like to know the process",
  "Hi, kindly guide me further",

  "Hello, I just checked your site",
  "Hi, I need clarification about your service",
  "Hello, can you assist me?",
  "Hi, I want to get started",
  "Hello, please tell me more",
  "Hello, I want to proceed further",
  "Hello, I am interested in your offers",
  "Hi, I want to confirm something",
  "Hello, can we discuss this?",
  "Hi, I need help regarding my order",
];

const getRandomMessage = () => {
  return greetings[Math.floor(Math.random() * greetings.length)];
};

// ✅ Your WhatsApp Number is fixed here
const WHATSAPP_NUMBER = "918210220189";

const WhatsAppButton = ({ className = "", children = "Contact Us" }) => {
  const message = getRandomMessage();
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={link}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export default WhatsAppButton;
