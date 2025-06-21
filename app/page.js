import Link from 'next/link';


export default function InfoPage() {
  return (
    <div className="bg-light-bg text-light-text">
      <main className="flex-grow container mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-5xl font-bold text-accent mb-4">Welcome to StudXchange</h1>
          <p className="text-xl text-secondary mb-8">The ultimate marketplace for students to buy and sell used items, find notes, and even look for accommodation.</p>
          <div className="space-x-4">
            <Link href="/login" className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition duration-300">
              Get Started
            </Link>
            <Link href="/about" className="bg-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition duration-300">
              Learn More
            </Link>
          </div>
        </section>

        <section className="mt-20 bg-primary py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose StudXchange?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">For Students, By Students</h3>
              <p className="text-light-text">A platform tailored to the needs of student life. Find everything from textbooks to bikes from fellow students in your campus area.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-light-text">We prioritize your safety. With our secure platform, you can transact with confidence.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-light-text">By buying and selling used items, you're not just saving money—you're also helping the environment.</p>
            </div>
          </div>
        </section>
      </main>
      </div>
  );
}
