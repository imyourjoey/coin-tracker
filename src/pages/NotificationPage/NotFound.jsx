import IconNotFound from "../../assets/Icons/IconNotFound";

function NotFound() {
  return (
    <>
      <div className="flex justify-center">
        <div>
          <IconNotFound width="400" height="350" />
          <div className="text-center text-3xl font-semibold">Whoops!</div>
          <div className="text-center mt-2 text-gray-500">
            The page you're looking for does not exist!
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
