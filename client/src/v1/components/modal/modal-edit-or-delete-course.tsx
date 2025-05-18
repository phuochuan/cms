import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {courseSchema} from "../../schemas/course-schema.ts";
import {Button} from "../ui/button.tsx";
import {CourseForm} from "../course/course-form.tsx";
import {Form} from "../ui/form.tsx";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog.tsx";
import {useNavigate} from "react-router-dom";

import {toast} from "sonner";
import blobToFile from "../../utils/convertBlobToFile.ts";
import {base64ToBlob} from "../../utils/ThumbnailConverter.ts";
import ModalConfirm from "./modal-confirm.tsx";
import {useRefreshState} from "../../hooks/use-refresh-state.ts";
import {deleteCourseById, editCourse} from "../../service/course.ts";
import {CourseType} from "../../screens/user/detail-of-course.tsx";


type Props = {
    children: React.ReactNode;
    courseData?: CourseType | undefined | unknown;
    open?: boolean
    onOpenChange?: ((open: boolean) => void)
};

const ModalEditOrDeleteCourse = ({children, courseData, open, onOpenChange}: Props) => {
    const navigate = useNavigate();
    const {setCourseDetailFlag} = useRefreshState((state) => state);
    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        mode: "onBlur",
        defaultValues: {
            id: "",
            name: "",
            teacherName: "",
            link: "",
            level: "",
            platform: "",
            categories: [],
            thumbnailUrl: "",
        },
    });

    if (courseData?.thumbnailUrl.includes("Default Course thumnail 1.svg")) {
        courseData.thumbnailUrl = "";
    }

    const handleConfirm = async () => {
        const response = await deleteCourseById(courseData?.id);
        if (response && response.status === 200) {
            toast.success("Course Deleted Successfully!", {
                description:
                    "The course has been successfully deleted. You can verify it in the course list.",
            });
            navigate("/admin/courses");
        } else if (response && response.status === 400) {
            toast.error("Course Delete Failed!", {
                description: response.data.message,
            });
        } else {
            toast.error("Course Delete Failed!", {
                description: "An error occurred while deleting the course.",
            });
        }
    };

    async function onSubmit(values: z.infer<typeof courseSchema>) {
        const formData = new FormData();
        values.id = courseData?.id;
        formData.append("id", values.id!);
        Object.entries(values).forEach(([key, value]) => {
            if (key !== "categories" && key !== "thumbnailUrl") {
                if (typeof value === "string") {
                    formData.append(key, value);
                }
            }
        });

        values.categories.forEach((category, index) => {
            formData.append(`categories[${index}].label`, category.label!);
            formData.append(`categories[${index}].value`, category.value);
        });

        // Handle the thumbnailUrl if it starts with "blob:" or "data:"
        if (values.thumbnailUrl.startsWith("blob:")) {
            const thumbnailFile = await blobToFile(
                values.thumbnailUrl,
                values.name
            );
            if (thumbnailFile) {
                formData.append("thumbnailFile", thumbnailFile);
            }
        } else if (values.thumbnailUrl.startsWith("data:")) {
            const thumbnailFromBase64 = base64ToBlob(values.thumbnailUrl);
            if (thumbnailFromBase64) {
                const thumbnailFile = new File(
                    [thumbnailFromBase64],
                    `${values.name}.jpg`,
                    {type: thumbnailFromBase64.type}
                );
                formData.append("thumbnailFile", thumbnailFile);
            }
        } else {
            formData.append("thumbnailUrl", values.thumbnailUrl);
        }
        if (formData.get("thumbnailUrl")?.toString().match("/api/thumbnail/")) {
            formData.delete("thumbnailUrl");
        }
        const status = await editCourse(formData);
        if (status === 200) {
            setCourseDetailFlag();

            navigate("/admin/outside-courses");

            if (onOpenChange) {
                onOpenChange(false);
            }

            toast.success("Edit course succesfully", {
                description: "Course information already updated!",
                style: {
                    color: "green",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        } else if (status === 500) {
            toast.error("Oops! Something went wrong. Please try again later", {
                description: "Contact the admin for further assistance!",
                style: {
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        } else if (status === 409) {
            toast.error("Edit course unsuccessfully", {
                description:
                    "Course link already exists in the system. Please check again!",
                style: {
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        } else if (status === 404) {
            toast.error("Edit course unsuccessfully", {
                description:
                    "Course not found in the system. Please check again!",
                style: {
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        } else {
            toast.error("Oops! Something went wrong. Please try again later", {
                description: "Contact the admin for further assistance!",
                style: {
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!onOpenChange && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className='max-w-[1100px] w-full px-3 rounded-xl min-h-[600px]'>
                <DialogTitle></DialogTitle>
                <Form {...form}>
                    <form
                        className='w-full'
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <CourseForm
                            form={form}
                            isEdit={true}
                            course={courseData}
                        />

                        <div className='flex justify-end gap-2 mt-8'>
                            <ModalConfirm
                                title='Delete a course'
                                handleConfirm={handleConfirm}
                                cancelButtonTitle='No'
                                acceptButtonTitle='Yes'
                                description='Do you want to delete this course?'
                            >
                                <Button
                                    type='button'
                                    className='bg-red-600 text-white w-32 h-9'
                                >
                                    Delete
                                </Button>
                            </ModalConfirm>

                            {/* <Modal
                title={<p style={{ fontSize: "1.2rem" }}>Delete a course</p>}
                onOk={handleConfirm}
                okText="Yes"
                cancelText="No"
                centered={true}
                okButtonProps={{
                  style: {
                    backgroundColor: "#861fa2",
                    color: "white",
                    width: "80px",
                  },
                }}
                cancelButtonProps={{
                  style: {
                    borderColor: "#ccc",
                    color: "black",
                    width: "80px",
                  },
                }}
              >
                <p style={{ fontSize: "1rem", margin: "10px 0px 40px 0px" }}>
                  Do you want to delete this course?
                </p>
              </Modal> */}
                            <Button
                                type='submit'
                                className='bg-green-600 text-white w-32 h-9'
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ModalEditOrDeleteCourse;
