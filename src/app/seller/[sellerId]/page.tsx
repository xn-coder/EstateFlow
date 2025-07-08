
import { getWebsiteData } from '@/app/manage-website/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function SellerLandingPage({ params }: { params: { sellerId: string } }) {
  const sellerId = params.sellerId;
  const websiteData = await getWebsiteData(sellerId);

  // If no user/website data is found for the given ID, show a 404 page.
  if (!websiteData || !websiteData.businessInfo?.name) {
    notFound();
  }

  const { businessInfo, slideshows, contactDetails, legalInfo, links } = websiteData;

  return (
    <div className="bg-slate-50 min-h-screen font-body text-slate-800 antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href={`/seller/${sellerId}`} className="flex items-center gap-4">
            <Image src={businessInfo.avatar || 'https://placehold.co/50x50.png'} alt={`${businessInfo.name} logo`} width={50} height={50} className="rounded-full" data-ai-hint="logo company" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{businessInfo.name}</h1>
              <p className="text-sm text-slate-500">{businessInfo.tagline}</p>
            </div>
          </Link>
        </div>
      </header>

      <main>
        {/* Slideshow */}
        {slideshows && slideshows.length > 0 && (
          <section className="relative w-full bg-slate-800">
            <Carousel opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {slideshows.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <Link href={slide.link || '#'}>
                        <div className="relative h-[60vh] max-h-[700px] w-full">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover" data-ai-hint="presentation slide" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg px-4">{slide.title}</h2>
                        </div>
                        </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-white/50" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-white/50" />
            </Carousel>
          </section>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 md:space-y-20">
          {/* About Us */}
          <section id="about">
            <Card className="overflow-hidden shadow-lg">
              <div className="md:grid md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">About Us</h2>
                  <p className="text-slate-600 leading-relaxed">
                    {legalInfo.about}
                  </p>
                </div>
                <div className="relative h-64 md:h-full min-h-[300px]">
                   <Image src="https://placehold.co/600x400.png" alt="About us image" fill className="object-cover" data-ai-hint="team meeting"/>
                </div>
              </div>
            </Card>
          </section>

          {/* Contact Us */}
          <section id="contact">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Get In Touch</h2>
              <p className="text-slate-500 mt-2">We'd love to hear from you. Here's how you can reach us.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <MapPin className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Address</h3>
                <p className="text-slate-600 mt-1">{contactDetails.address}</p>
              </div>
              <div className="p-6">
                <Mail className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Email</h3>
                <a href={`mailto:${contactDetails.email}`} className="text-primary hover:underline mt-1 block break-all">{contactDetails.email}</a>
              </div>
              <div className="p-6">
                <Phone className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Phone</h3>
                <a href={`tel:${contactDetails.phone}`} className="text-primary hover:underline mt-1 block">{contactDetails.phone}</a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start items-center gap-4">
              <Image src={businessInfo.avatar || 'https://placehold.co/40x40.png'} alt={`${businessInfo.name} logo`} width={40} height={40} className="rounded-full" data-ai-hint="logo company" />
              <p className="text-center text-sm text-slate-400 sm:text-left">{businessInfo.name}</p>
            </div>
            <div className="mt-4 flex justify-center space-x-6 sm:mt-0 sm:justify-start">
              <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">Facebook</span><Facebook /></a>
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">Instagram</span><Instagram /></a>
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">YouTube</span><Youtube /></a>
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">LinkedIn</span><Linkedin /></a>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-4 md:order-2 justify-center flex-wrap">
              <a href={legalInfo.terms} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Terms</a>
              <a href={legalInfo.privacy} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Privacy</a>
              <a href={legalInfo.refund} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Refund Policy</a>
            </div>
            <p className="mt-8 text-center text-sm text-slate-400 md:order-1 md:mt-0">&copy; {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
