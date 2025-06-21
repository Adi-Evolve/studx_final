export default function Footer() {
  return (
    <footer className="bg-accent text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} StudXchange. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-secondary">About Us</a>
          <a href="#" className="hover:text-secondary">Contact</a>
          <a href="#" className="hover:text-secondary">Terms of Service</a>
          <a href="#" className="hover:text-secondary">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
