interface InfoBoxProps {
  title: string
  value?: string
  isMono?: boolean
  children?: React.ReactNode
}

export default function InfoBox({ title, value, isMono, children }: InfoBoxProps) {
  return (
    <div className="card-brutal">
      <h3 className="heading-brutal text-lg mb-4">{title}</h3>
      {value && (
        <div className={isMono ? "mono-brutal" : "body-brutal"}>
          {value}
        </div>
      )}
      {children && children}
    </div>
  )
}