import {Header} from "../../components/Header";
import {sanityClient, urlFor} from "../../sanity";
import {Comment, Post} from "../../typings";
import {GetStaticProps} from "next";
import PortableText from "react-portable-text";
import {SubmitHandler, useForm} from "react-hook-form";
import {useState} from "react";
import {HorizontLine} from "../../components/HorizontLine";

interface Props {
  post: Post
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post( {post}: Props) {

  console.log(post)

  return <main>
    <Header />
    <img
      className="w-full h-40 object-cover"
      src={urlFor(post.mainImage).url()!}
      alt=""
    />
    <article className="max-w-3xl mx-auto p-5">
      <h1 className="text-3xl mt-10 mb-3">
        {post.title}
      </h1>
      <h2 className="text-xl font-light text-gray-500 mb-2">
        {post.description}
      </h2>
      <div className="flex items-center space-x-2">
        <img
          className="w-12 h-12 rounded-full"
          src={urlFor(post.author.image).url()!}
          alt=""
        />
        <p
          className="font-extralight text-md"
        >
          Blog post by {" "}
          <span className="text-green-600 font-medium"> {post.author.name} </span>
          - Published at {" "}
          {new Date(post._createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-5">
        <PortableText
          className=""
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={post.body}
          serializers={
            {
              h1: (props: any) => (
                  <h1 className="text-2xl font-bold my-5" {...props}/>
              ),
              h2: (props: any) => (
                  <h2 className="text-xl font-bold my-5" {...props}/>
              ),
              p: (props: any) => (
                  <p className="text-md font-medium" {...props}/>
              ),
              li: (props: any) => (
                  <li className="ml-4 list-disc" {...props}/>
              ),
              link: (props: any) => (
                  <a className="text-blue-500 hover:underline" {...props}/>
              ),
            }
          }
        />
      </div>
    </article>
    <HorizontLine />
    <PostForm postId={post._id} />
    <PostComments comments={post.comments} />
  </main>
}

export const PostForm = ({postId} : {postId: string}) => {

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<IFormInput>();

  const onSubmitHandler = () => {
    setIsSubmitted(true);
    setLoading(false);
  }

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setLoading(true);

    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data)
      }).then(() => {
        onSubmitHandler();
      }).catch((err) => {
        onSubmitHandler();
      });
    }

    return <div>
      {isSubmitted
          ? (
              <div className="flex flex-col py-7 px-5 my-10 mx-auto max-w-2xl bg-yellow-500 text-white rounded">
                <h3 className="font-bold text-3xl">Thank you for submitting tour comment!</h3>
                <p className="font-normal text-xl">Once it has been approved, it will appear below!</p>
                <button
                    className="bg-white text-yellow-500 font-bold w-1/4 mt-5 mx-auto rounded"
                    onClick={() => setIsSubmitted(false)}
                  >
                  Got it
                </button>
              </div>
          )
          : (
              <form className="flex flex-col max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
                <input
                    {...register("_id")}
                    type="hidden"
                    name="_id"
                    // current postId to link comment...
                    value={postId}
                />

                <label className="block mb-5">
                  <span className="text-gray-700">Name</span>
                  <input
                      {...register("name", {required: true})}
                      className="shadow border rounded py-2 px-3 form-input mt-1
                    block w-full focus:outline-none focus:border-yellow-500 focus:border-2
                    hover:border-yellow-400 hover:cursor-pointer"
                      placeholder="Example Name" type="text"/>
                </label>
                <label className="block mb-5">
                  <span className="text-gray-700">Email</span>
                  <input
                      {...register("email", {required: true})}
                      className="shadow border rounded py-2 px-3 form-input mt-1
                    block w-full ring-offset-4 focus:outline-none focus:border-yellow-500 focus:border-2
                    hover:border-yellow-400 hover:cursor-pointer"
                      placeholder="example@gmail.com" type="text"/>
                </label>
                <label className="block mb-5">
                  <span className="text-gray-700">Comment</span>
                  <textarea
                      {...register("comment", {required: true})}
                      className="shadow border form-textarea py-2 px-3 w-full focus:outline-none
                    focus:border-yellow-500 focus:border-2 hover:border-yellow-400 hover:cursor-pointer"
                      placeholder="some text..."
                      rows={8} />
                </label>
                <div className="flex flex-col p-5">
                  {errors.name && (
                      <span className="text-red-500"> - The Name Field is required</span>
                  )}
                  {errors.email && (
                      <span className="text-red-500"> - The Email Field is required</span>
                  )}
                  {errors.comment && (
                      <span className="text-red-500"> - The Comment Field is required</span>
                  )}
                </div>

                <input
                    className="shadow bg-yellow-500 hover:bg-yellow-400
                  cursor-pointer focus:outline-none text-white font-bold py-2 px-4 rounded-sm"
                    type="submit"
                    disabled={loading}
                    value={loading ? "Sending..." : "Submit"}
                />
              </form>
          )}
    </div>
  }

export const PostComments = ({comments} : {comments: [Comment]}) => {
  return <div className="mb-10">
    <HorizontLine />
    <div className="flex flex-col space-y-2 max-w-2xl mx-auto border border-gray-200 p-5 rounded">
      <h2 className="mx-auto font-bold text-2xl mb-5">Comments</h2>
      {comments.length > 0
          ? comments.map((block, index) => {
              return (
                  <div className="flex items-center">
                    <div className="w-1/4 font-medium text-yellow-500">{block.name}</div>
                    <div className="w-3/4 font-light"><i>{block.comment}</i></div>
                  </div>
              )
            })
          : (
              <h2 className="mx-auto font-medium">
                There isn't any comments yet. Be the first!
              </h2>
          )
      }
    </div>
  </div>
}

export const getStaticPaths = async () => {
    const query = `
    *[_type == "post"]{
      _id,
      slug {
        current
      }
    }`;
    // find all posts (with slug filter)...
    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
      params: {
        slug: post.slug.current
      }
    }))

    console.log(paths);

    return {
      paths,
      fallback: "blocking"
    }

  }

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `
    *[_type == "post" && slug.current == $slug][0]{
      _id,
      _createdAt,
      title,
      author-> {
        name,
        image
      },
      'comments': *[
        _type == "comment" &&
        post._ref == ^._id &&
        approved == true
      ],
      description,
      mainImage,
      slug,
      body
    }
  `;
    const post = await sanityClient.fetch(query, {
      // params.slug contains ours ulr slug...
      slug: params?.slug,
    });

    if (!post) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        post,
      },
      revalidate: 60, // after 60 seconds, fill update the old cached version
    }
  }

export default Post;

