import FileDetail from "@/components/FileDetail";

export default function FileDetailSection({ file }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <FileDetail 
      file={file}
       />
    </div>
  );
}