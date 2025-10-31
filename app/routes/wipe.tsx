import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import Navbar from "~/components/Navbar";
import {usePuterStore} from "~/lib/puter";

const WipeApp = () => {
  const {auth, isLoading, error, fs, kv} = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    } else if (auth.isAuthenticated) {
      loadFiles();
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleDelete = async () => {
    await Promise.all(files.map((file) => fs.delete(file.path)));
    await kv.flush();
    await loadFiles();
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Wipe Application Data</h1>
          <h2>This is a developer tool to clear all stored data.</h2>
        </div>

        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!isLoading && auth.isAuthenticated && (
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-2xl max-w-2xl mx-auto flex flex-col gap-6">
            <p>
              Authenticated as: <strong>{auth.user?.username}</strong>
            </p>
            <div>
              <h3 className="text-lg font-semibold mb-2">Existing files:</h3>
              <ul className="list-disc list-inside bg-gray-100 p-4 rounded-lg">
                {files.length > 0 ? (
                  files.map((file) => <li key={file.id}>{file.name}</li>)
                ) : (
                  <li>No files found.</li>
                )}
              </ul>
            </div>
            <button className="primary-button" onClick={handleDelete}>
              Wipe App Data
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default WipeApp;
