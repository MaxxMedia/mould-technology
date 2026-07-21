// "use client"

// import { UploadCloud, FileText } from "lucide-react"

// type Props = {
//   label: string
//   value?: string
//   onUpload: (file: File) => void
//   height?: string
//   accept?: string
// }

// export default function UploadBox({
//   label,
//   value,
//   onUpload,
//   height = "h-40",
//   accept = "image/*,application/pdf"
// }: Props) {

//   const isPdf = value?.toLowerCase().endsWith(".pdf")

//   return (
//     <div>
//       <p className="font-medium mb-2">{label}</p>

//       <label className="block cursor-pointer">
//         <input
//           type="file"
//           accept={accept}
//           hidden
//           onChange={e => {
//             if (e.target.files && e.target.files[0]) {
//               onUpload(e.target.files[0])
//             }
//           }}
//         />

//         {value ? (
//           <div className="relative">
//             {isPdf ? (
//               <div className={`w-full ${height} flex flex-col items-center justify-center border rounded-lg bg-gray-50`}>
//                 <FileText size={42} className="text-red-500 mb-2" />
//                 <p className="text-sm text-gray-600">PDF Uploaded</p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Click to replace file
//                 </p>
//               </div>
//             ) : (
//               <img
//                 src={value}
//                 alt="Uploaded"
//                 className={`w-full ${height} object-cover rounded-lg border`}
//               />
//             )}
//           </div>
//         ) : (
//           <div
//             className={`w-full ${height} flex flex-col items-center justify-center
//               border-2 border-dashed border-gray-300 rounded-lg
//               hover:border-blue-500 transition`}
//           >
//             <UploadCloud size={42} className="text-gray-400 mb-2" />
//             <p className="text-gray-500 text-sm">
//               Click to upload file
//             </p>
//           </div>
//         )}
//       </label>
//     </div>
//   )
// }


"use client"

import { UploadCloud, FileText } from "lucide-react"

type Props = {
  label: string
  value?: string
  onUpload: (file: File) => void
  height?: string
  accept?: string
  multiple?: boolean   // ✅ NEW (optional)
}

export default function UploadBox({
  label,
  value,
  onUpload,
  height = "h-40",
  accept = "image/*,application/pdf",
  multiple = false,   // ✅ default false
}: Props) {

  const isPdf = value?.toLowerCase().endsWith(".pdf")

  return (
    <div>
      <p className="font-medium mb-2">{label}</p>

      <label className="block cursor-pointer">
        <input
          type="file"
          accept={accept}
          multiple={multiple}   // ✅ enable multiple when needed
          hidden
          onChange={e => {
            if (!e.target.files) return

            if (multiple) {
              Array.from(e.target.files).forEach(file => {
                onUpload(file)
              })
            } else {
              onUpload(e.target.files[0])
            }
          }}
        />

        {/* SINGLE FILE PREVIEW */}
        {!multiple && value ? (
          <div className="relative">
            {isPdf ? (
              <div className={`w-full ${height} flex flex-col items-center justify-center border rounded-lg bg-gray-50`}>
                <FileText size={42} className="text-red-500 mb-2" />
                <p className="text-sm text-gray-600">PDF Uploaded</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click to replace file.
                </p>
              </div>
            ) : (
              <img
                src={value}
                alt="Uploaded"
                className={`w-full ${height} object-cover rounded-lg border`}
              />
            )}
          </div>
        ) : (
          <div
            className={`w-full ${height} flex flex-col items-center justify-center
              border-2 border-dashed border-gray-300 rounded-lg
              hover:border-blue-500 transition`}
          >
            <UploadCloud size={42} className="text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">
              Click to upload {multiple ? "files" : "file"}
            </p>
          </div>
        )}
      </label>
    </div>
  )
}
