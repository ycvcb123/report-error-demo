function processArray(array) {
  if (!Array.isArray(array)) {
    throw new Error('Invalid input: array must be an array');
  }

  const result = [];

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const processedItem = processItem(item);
    result.push(processedItem);
  }

  return result;
}

function processItem(item) {
  if (typeof item !== 'object' || item === null) {
    throw new Error('Invalid input: item must be an object');
  }

  const { value } = item;

  if (typeof value !== 'number') {
    throw new Error('Invalid input: value must be a number');
  }

  const processedValue = value * 2;

  return { processedValue };
}

const inputArray = [1, 2, 3, 4, 5];
const processedArray = processArray(inputArray);
console.log(processedArray);