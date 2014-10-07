---
layout: post
title: Job interviews
category: people
tags: [interview]
description: Some return of experience, questions and toughts.
---

[Like it or not](http://techcrunch.com/2013/06/22/the-technical-interview-is-dead/), technical interviews are still a reality in the software industry and my guess is that it is not going to stop anytime soon. I am not saying that I find the current process good but it will take time to make people evolve on the subject. So you better get ready for this or start your own company.

Getting a job in a place where you have [no connection](http://www.karenx.com/blog/how-to-get-a-job-when-you-have-no-connections/) can prove very hard. My (obvious?) guess: the bigger/hotter the company, the harder. You may try to be original but I am not sure this helps to get a job at a very big corporation. IMO, you better be concise, have a clear message, show why you care about the company you're applying at and hopefully you'll have a chance to show them your abilities. Of course, if you've already shown the world with some of your project, this might have proven easier than it sounds to get to the interview process.


# Screen interviews

The first step will probably be a phone call with some HR. Be prepared to explain your experience as briefly and clearly as possible and try to be passionate about what you've accomplished so far. In my experience, you have to be able to explain the logic out of your different experiences to show that you have not been changing jobs for the sake of it (or the pay) and to "justify" why you are actually having this interview.

You might then have a technical screen interview where you'll be asked some questions such as:

* explain the lastest project you've been working on
* do you code at home?
* explain differences between a thread & a process
* explain what a hash table is, what it is used for and how it is implemented
* explain what a critical section is
* explain what a deadlock is
* sort a list of words
* explain how the sorting algorithm works
* sort 5 petabytes of words
* reverse the words in a string of multiple words without using more memory than needed (e.g. "dog cat" should become "cat dog")
* count bits in a integer (write actual code via skype)
* given a function to print one char, write a function printing a string without using iteration
* count the number of single child in a binary tree
* determine if an array of integers contains duplicates
* do you have any questions?

Those are not difficult questions but still you have to be prepared as, if you do not regularly practice, you may have forgotten how [Quicksort](http://en.wikipedia.org/wiki/Quicksort) works.


# On site interviews

If you were convincing enough, you should go for an on site interview loop (and hopefully not the [anti loop](http://steve-yegge.blogspot.fr/2008/03/get-that-job-at-google.html) version). Here are some advice:

* be prepared; you've heard it before but there is no secret. There is a part of luck and preparation. From my experience, you probably won't have very very hard questions but still you need to have some practice.
* stay concentrate; at big corporations, you may have 5 interviews in a row which can prove physical.
* make sure you've understood the question; test your understanding with an example and ask your interviewer for validation.
* smile and stay positive; there might be questions that you don't know the answer directly. Do not show frustration. Show you are thinking, interact with your interviewer to try to find a solution.
* communicate a lot; explain your reasoning loudly. Your interviewer is judging your reasoning as much as your ability to solve the problem. And if you're going on a wrong direction, he/she might even give you an hint early.
* do *not* try to be smart. First find a working solution and if the interviewer wants a better one or prefers to skip the easy one, he/she will ask you to move on to the better solution. But looking for a "not naive" solution you may give the impression that you like complexity which is not good. At all.

Here are some questions you may encounter:

* given a list of reference words, write a method to list all anagrams of an input word. How would you design a webservice providing anagrams of a word?
* given a list of reference words and a string with all whitespace striped, how would you get the list of reference words contained in the string maximizing the number of characters being matched (e.g. if `reference = ["the", "then", "nuke"]` and `string = "thenuke"`, you should return `["the", "nuke"]`) (here is a [solution](http://stackoverflow.com/questions/12377231/how-to-tokenize-a-striped-string-based-on-a-list-of-patterns))
* given a matrix filled with 0's and 1's, we want to find the largest contiguous region of 1's. Implement code solving this problem. What if you are authorized to modify the input matrix?
* given a biased coin, provide a way to get unbiased output.
* given an array of size n containing all numbers from 1 to n, we replace one element with another (meaning one element is duplicating and one element is missing). Find those two numbers. Could you find a solution using O(1) memory?
* how would you sample p number out of an array of size n with uniform probability? (see [Reservoir sampling](http://en.wikipedia.org/wiki/Reservoir_sampling))
* given a datasets with two columns, `first_name` and `last_name`, find all rows where the fields have been swapped.
* given a list of hotels with their GPS coordinates, write code to find hotels near a given coordinate. What is the complexity? Could you do better?
    * we now want to improve hotel search by name. We want to use some specific 'fuzzy' matching. How would you implement a solution with the following rules:
        1. case insensitive;
        1. replace accented characters with unaccented one;
        1. be tolerant with doubled letters i.e. "fuzzy" and "fuzy" should match.
* revert the bits in an `int`.
* given an integer array, write a method listing all combination *with repetition* of those intergers in order. (Note: we want all n^n combinations! The "in order" information is important. As I said, you should write an example:
`[0, 1, 2] => [ [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 1, 0], [0, 1, 1], [0, 1, 2], [0, 2, 0], ...]`. You should see a pattern. This is a simple increment of numbers in base 3).


# In the end

You may have or not an offer. You may try to negociate your salary but I won't be of any help on that. However, just some final remarks:

* ask questions about working conditions and philosophy; [working long hours](http://alexstechthoughts.com/post/55085393173/stop-glorifying-hard-work-and-long-hours) might not be what you are looking for or people might work on their own when you feel good in a collaborative workplace;
* do *not* take a negative response personally. First time you hear 'no' it might be difficult (you might like reading [The Now Habit](http://www.amazon.com/The-Now-Habit-Overcoming-Procrastination/dp/1585425524) but that's for another post). Analyze what may have gone wrong to do a better job next time (remember that in the anti loop case you are not really the cause). You may ask some feedback about what you could have done better;
* this applies more for smaller companies as in big companies you may not have spend time with the actual people you would be working with: if you have any doubt, you might prefer not working at the company. This is [a rule](http://www.joelonsoftware.com/articles/GuerrillaInterviewing3.html) your interviewer should apply and from my experience, the interviewee should do the same;
* if the company forgot to give you an answer, send them an email. But companies that do not take time to give you an answer (which often is a standard email) is probably a company that you do *not* want to work for.

# Resources

* [stackoverflow](http://stackoverflow.com/search?q=interview)
* [glassdoor](http://glassdoor.com)
* [leetcode](http://leetcode.com)
* [cracking the coding interview](http://www.crackingthecodinginterview.com)
* [learn hacker earth](http://learn.hackerearth.com/)
* [geeks for geeks](http://www.geeksforgeeks.org)
* [all about puzzles](http://allaboutpuzzles.blogspot.in)
* [fresher interview questions](http://www.freshersinterviewquestions.com)
* [tech interview](http://www.techinterview.org/) no longer updated
* [my tech interviews](http://www.mytechinterviews.com/) no longer updated
