export default function SearchHistory() {
  const searches = [
    { id: 1, name: "2024 XR3", date: "2024-09-18" },
    { id: 2, name: "PHA-109", date: "2024-09-17" },
    { id: 3, name: "NEO-3321", date: "2024-09-15" },
  ]

  return (
    <div className="space-y-3">
      {searches.map(item => (
        <div
          key={item.id}
          className="flex justify-between text-sm text-gray-300 border-b border-white/10 pb-2"
        >
          <span className="text-[#FFB089]">{item.name}</span>
          <span>{item.date}</span>
        </div>
      ))}
    </div>
  )
}
