'use client'

import Link from 'next/link'

const internships = [
  { id: '1', title: 'Frontend Internship', company: 'TechSoft' },
  { id: '2', title: 'Backend Internship', company: 'CodeBase' },
]

const InternshipSidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 h-full p-4">
      <h2 className="text-xl font-bold mb-4">Internships</h2>
      <ul>
        {internships.map((internship) => (
          <li key={internship.id} className="mb-3">
            <Link
              href={`/internship/${internship.id}`}
              className="block p-3 bg-white shadow rounded hover:bg-gray-200"
            >
              <h3 className="font-semibold">{internship.title}</h3>
              <p className="text-sm text-gray-600">{internship.company}</p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default InternshipSidebar
