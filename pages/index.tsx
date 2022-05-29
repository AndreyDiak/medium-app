import Head from 'next/head'
import {Header} from "../components/Header";
import {sanityClient, urlFor} from "../sanity"
import {Post} from "../typings";
import Link from "next/link";

export const getServerSideProps = async () => {
  // sanity query...
  const query = `
    *[_type == "post"]{
      _id,
      title,
      author-> {
        name,
        image
      },
      description,
      mainImage,
      slug
    }
  `;
  // fetch data...
  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts
    }
  }
}

interface Props {
  posts: [Post]
}

function Home( {posts} : Props) {
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className="flex items-center justify-between bg-yellow-400 border-y border-black py-10 lg:py-0">
        <div className="px-10 space-y-5">
          <h1 className="text-6xl max-w-xl font-serif">
            <span className="underline decoration-black decoration-4">Medium</span> is a place to write, read, and connect
          </h1>
          <h2 className="text">
            It's easy and free to post your thinking on
            any topic and connect with millions of readers
          </h2>
        </div>

        <img
          className="hidden md:inline-flex h-32 lg:h-full"
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
          alt=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 md:p-6">
        {posts.map(post => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="border rounded-lg overflow-hidden group cursor-pointer">
              <img
                className="h-60 w-full object-cover group-hover:scale-105
                transition-transform duration-200 ease-in-out"
                src={urlFor(post.mainImage).url()!}
                alt=""/>
              <div className="flex justify-between items-center p-5 bg-white">
                <div>
                  <h3 className="text-lg font-bold" >{post.title}</h3>
                  <p className="text-sm font-normal">{post.description} by {post.author.name}</p>
                </div>

                <img
                  className="w-12 h-12 rounded-full"
                  src={urlFor(post.author.image).url()!}
                  alt=""/>
              </div>

            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}

export default Home
