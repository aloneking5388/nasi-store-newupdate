import { Input } from "../ui/input";

const Search = ({ setParPage, setSearchValue, searchValue }: any) => {
  return (
    <div className="flex justify-between items-center">
      <select
        onChange={(e) => setParPage(parseInt(e.target.value))}
        className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046]border border-slate-700 rounded-md text-[#d0d2d6]"
      >
        <option value="5">5</option>
        <option value="15">15</option>
        <option value="25">25</option>
      </select>
      <Input
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        className="px-4 py-2 focus:border-indigo-500 outline-none border border-slate-700 rounded-md text-[#d0d2d6] "
        type="text"
        placeholder="Search"
      />
    </div>
  );
};

export default Search;
