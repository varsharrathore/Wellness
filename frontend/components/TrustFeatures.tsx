'use client';

import { Package, Shield, Lock, Eye } from 'lucide-react';

const features = [
  {
    icon: Package,
    title: "Discreet Packaging",
    description: "All products will come in plain brown boxes."
  },
  {
    icon: Shield,
    title: "The Best Quality",
    description: "All our products are dually checked and verified to meet hygiene standards."
  },
  {
    icon: Lock,
    title: "Discreet Billing",
    description: "Billing appears with a neutral company name."
  },
  {
    icon: Eye,
    title: "Privacy & Security",
    description: "Your privacy is our top priority."
  }
];

export default function TrustFeatures() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:-translate-y-2 transition-all duration-300"
            >
              <feature.icon className="h-12 w-12 text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-gray-900 text-lg font-semibold mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
