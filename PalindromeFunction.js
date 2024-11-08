
function isPalindrome(str) {
    const formatString = str.trim().toLowerCase();
    const reverseString = formatString.split('').reverse().join('');
    if (formatString === reverseString) {
        return 'Yes, it is a palindrome!';
      } else {
        return 'No, it is not a palindrome.';
      }
  }
  console.log(isPalindrome('madam'));  
  