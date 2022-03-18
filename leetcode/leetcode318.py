# https://leetcode.com/problems/maximum-product-of-word-lengths/

class Solution(object):
    def maxProduct(self, words):
        distinct = {}

        for w in words:
            distinct[w] = ''.join(set(w))

        max_score = 0
        for i in range(len(words) - 1):
            a_word = words[i]
            a_distinct = distinct[a_word]

            for b_word in words[i+1:]:
                b_distinct = distinct[b_word]
                if self.shares_letters(a_distinct, b_distinct):
                    continue
            
                score = len(a_word) * len(b_word)
                if score > max_score:
                    max_score = score

        return max_score

    def shares_letters(self, a, b):
        for x in a:
            if x in b:
                return True

        return False


sol = Solution()
score = sol.maxProduct(["abcw", "baz", "foo", "bar", "xtfn", "abcdef"])
score2 = sol.maxProduct(["a","ab","abc","d","cd","bcd","abcd"])
score3 = sol.maxProduct(["a","aa","aaa","aaaa"])
score4 = sol.maxProduct(["eae","ea","aaf","bda","fcf","dc","ac","ce","cefde","dabae"])
print(score)
print(score2)
print(score3)
print(score4)
