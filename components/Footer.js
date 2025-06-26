export default function Footer() {
  return (
    <footer className="bg-studx-gradient text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} StudX. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-emerald-200 transition-colors">About Us</a>
          <a href="#" className="hover:text-emerald-200 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-emerald-200 transition-colors">Privacy Policy</a>
        </div>
        <div className="mt-4">
            <p>
                Contact: <a href="mailto:adiinamdar888@gmail.com" className="hover:text-emerald-200 transition-colors">adiinamdar888@gmail.com</a>
                <span className="mx-2">|</span>
                <a href="tel:8857053541" className="hover:text-emerald-200 transition-colors">8857053541</a>
            </p>
        </div>
      </div>
    </footer>
  );
}
