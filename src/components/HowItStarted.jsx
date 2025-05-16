import about from "../assets/about.png";

export default function HowItStarted() {
  return (
    <section className="bg-[radial-gradient(circle_at_center,_#F1E2FE_0%,_#F3ECFF_10%,_#EEF7FF_90%)] py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 mb-5 mt-5">
        <div className="w-full md:w-1/2" style={{ width: "60%" }}>
          <img
            src={about}
            alt="Patient interacting"
            className="rounded-xl shadow-md"
          />
        </div>
        <div className="w-full md:w-1/2 text-left">
          <div
            className="bg-white rounded-full text-gray-500 mb-4"
            style={{
              width: "fit-content",
              fontSize: "0.7rem",
              padding: "0.2rem 0.8rem 0.2rem 0.8rem",
              border: "1px solid gray",
              boxShadow: "1px 2px 5px gray",
            }}
          >
            Our Story
          </div>
          <h2 className="cormorant text-5xl font-bold text-gray-800 mb-4">
            How It All Started?
          </h2>
          <p
            className="text-gray-600 text-lg leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
            This is Gonzalo—a survivor, a fighter, and a beacon of hope.
            Gonzalo’s journey is extraordinary. He first underwent open-heart
            surgery, faced 2 heart attacks, then faced kidney failure, 2
            strokes, and gangrene. Today, he’s a double amputee and is looking
            for a clinical trial.
            <br />
            <br />
            Gonzalo is the reason we started NxtCure- to help patients like him
            find clinical trials that offer hope, healing, and a path forward.
            Gonzalo is currently look for a treatment for his heart condition
            and his stroke. He and patients just like him was our motivation for
            starting NxtCure- we believe everyone should have an opportunity for
            treatment. NxtCure is here to guide patients like him every step of
            the way.
          </p>
        </div>
      </div>
    </section>
  );
}
