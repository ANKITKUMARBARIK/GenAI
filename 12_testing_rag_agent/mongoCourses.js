import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("lms");

export async function getCoursesText() {
    const courses = await db.collection("courses").find({}).toArray();
    const enrollments = await db.collection("enrollments").find({}).toArray();

    const docs = courses.map((course) => {
        const enrolledUsers =
            enrollments
                .filter(
                    (e) => e.course === course.title && e.status === "active"
                )
                .map((e) => e.user)
                .join(", ") || "No active enrollments";

        return {
            pageContent: `
                Title: ${course.title}
                Price: ${course.price}
                Available: ${course.available}
                Category: ${course.category}
                Enrolled Users: ${enrolledUsers}
            `,
            metadata: {
                courseId: course._id.toString(),
                title: course.title,
                price: course.price,
                available: course.available,
                category: course.category,
                enrolledUsers: enrolledUsers.split(", ").map((u) => u.trim()),
            },
        };
    });

    return docs;
}
