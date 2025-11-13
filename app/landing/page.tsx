import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from './components/HeroSection'
import WhyIroncladLockSection from './components/WhyIroncladSection'
import HowItWorksSection from './components/HowItWorksSection'
import TestimonialStackSection from './components/TestimonialStackSection'
import CommunitySection from './components/CommunitySection'
import TransitionWrapper from '../transition-wrapper'

export default function LandingPage() {
  return (
    <TransitionWrapper>
      <Header />
      <main>
        <Hero />
        <WhyIroncladLockSection />
        <HowItWorksSection />
        <TestimonialStackSection />
        <CommunitySection />
      </main>
      <Footer />
    </TransitionWrapper>
  )
}