interface FeatureCardProps {
  title: string;
  description: string;
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="card-pro">
      <div className="text-heading text-lg mb-3">
        {title}
      </div>
      <div className="text-body">
        {description}
      </div>
    </div>
  )
}
