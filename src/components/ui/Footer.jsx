const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-green-100 py-4 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-700">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
