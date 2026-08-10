'use client'
import React from 'react'
import { FaFacebook, FaWhatsapp } from 'react-icons/fa'
import { MdOutlineEmail } from 'react-icons/md'
import { FaXTwitter } from "react-icons/fa6";

interface Props {
  message: string       // Share message (customizable)
  url: string           // URL to share
}

const UniversalShareButtons: React.FC<Props> = ({ message, url }) => {
  const encodedMsg = encodeURIComponent(`${message}\n${url}`)
  const encodedUrl = encodeURIComponent(url)

  const whatsappUrl = `https://wa.me/?text=${encodedMsg}`
  const emailUrl = `mailto:?subject=Check this out&body=${encodedMsg}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMsg}&url=${encodedUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        className="bg-green-500 text-lg max-sm:text-xs hover:bg-green-600 text-white p-2 rounded-full">
       <FaWhatsapp />
      </a>

      <a href={emailUrl}
        className="bg-blue-600 text-lg max-sm:text-xs hover:bg-blue-700 text-white p-2 rounded-full">
        <MdOutlineEmail />
      </a>

      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
        className="bg-black text-lg max-sm:text-xs hover:bg-blue-500 text-white p-2 rounded-full">
        <FaXTwitter />
      </a>

      <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
        className="bg-blue-800 text-lg max-sm:text-xs hover:bg-blue-900 text-white p-2 rounded-full">
        <FaFacebook />
      </a>
    </div>
  )
}

export default UniversalShareButtons
