import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
            Deeper Knowledge,{" "}
            <span className="font-serif italic font-normal">Higher Adab</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Dapatkan akses ke e-book berkualitas, e-course praktis, dan berbagai 
            konten edukatif untuk mengembangkan potensi diri.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link to="/product">
                Lihat Produk
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/project">
                Jelajahi Project
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
