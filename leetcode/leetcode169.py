# https://leetcode.com/problems/majority-element/

class Solution(object):
    def majorityElement(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        if len(nums) == 1:
            return nums[0]

        count = {}
        for num in nums:
            if num in count:
                count[num] += 1

                # this coult be optimized more i think but it's good for now
                if count[num] > len(nums) / 2:
                    return num
            else:
                count[num] = 1

        return -1


a = Solution()
element = a.majorityElement([2, 2, 1, 1, 1, 2, 2])
print(element)
