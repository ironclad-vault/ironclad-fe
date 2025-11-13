interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="card-brutal">
      <div className="heading-brutal text-lg mb-3">
        {title}
      </div>
      <div className="body-brutal">
        {description}
      </div>
    </div>
  )
}