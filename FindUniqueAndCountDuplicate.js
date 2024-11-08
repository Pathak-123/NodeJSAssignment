
function findUniqueAndCountDuplicates(arr) {
    const counts = {};
    arr.forEach((item) => {
      counts[item] = counts[item] ? counts[item] + 1 : 1;
    });
    const uniqueValues = Object.keys(counts).filter((key) => counts[key] === 1);
    const duplicates = Object.keys(counts).filter((key) => counts[key] > 1);
    return {
      uniqueValues: uniqueValues,
      duplicateCounts: duplicates.map((item) => ({
        value: item,
        count: counts[item]
      }))
    };
  }
  
  
  const arr = [1, 2, 3, 2, 4, 5, 3, 6, 7, 8, 8, 9];
  
  const result = findUniqueAndCountDuplicates(arr);
  
  console.log("Unique Values:", result.uniqueValues);
  
  console.log("Duplicate Counts:", result.duplicateCounts); 
  