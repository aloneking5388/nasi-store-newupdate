export const buildTextSearchQuery = (searchValue: string, status: string) => {
  const query: any = { status };

  if (searchValue.trim() !== "") {
    query.$text = { $search: searchValue };
  }

  return query;
};
