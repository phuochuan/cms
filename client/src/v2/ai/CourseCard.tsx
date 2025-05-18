
const CourseCard = ({ course }) => {
    const {
        name,
        link,
        teacherName,
        description,
        categories,
        level,
        thumbnailUrl,
        durationPerWeek,
        platform,
    } = course;

    return (
        <div className="bg-white border border-gray-100 shadow-md rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-[100%] mx-auto">
            <div className="relative h-56">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={name || 'Course thumbnail'}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-gray-400 font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {level || 'Unknown'}
                </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {name || 'Untitled Course'}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {description || 'No description available.'}
                </p>

                <div className="text-sm text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Teacher:</span>
                        <span className="text-gray-600">{teacherName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Platform:</span>
                        <span className="text-gray-600">{platform || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Categories:</span>
                        <span className="text-gray-600">{categories || 'N/A'}</span>
                    </div>
                    {durationPerWeek && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Weekly:</span>
                            <span className="text-gray-600">{durationPerWeek} hours</span>
                        </div>
                    )}
                </div>

                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors duration-200 mt-2"
                    >
                        Explore Course
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
};

const CourseList = ({ courses }) => {
    return (
        <div className="w-full p-8 flex flex-col gap-8 items-center">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};

export default CourseList;
