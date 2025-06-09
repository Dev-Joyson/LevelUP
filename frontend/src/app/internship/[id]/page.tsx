import React from 'react'

const InternshipDetail = ({ params }: { params: { id: string } }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold">Internship Detail</h2>
            <p className="mt-2 text-gray-700">
                Showing details for internship ID: {params.id}
            </p>
        </div>
    )
}

export default InternshipDetail