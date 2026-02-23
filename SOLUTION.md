##POINT 1
In GET /api/items there was this comment: `// Intentional bug: backend ignores limit`

The backend does not ignore the limit parameter. I have verified the limit functionality from both the API execution and implementation. The comment was probably referring to the paginated list.

The limit was working, but this comment was likely related to pagination. Since we need to define proper pagination, we need another parameter to specify which page we are on and how many elements we want to extract from each page, so I have updated that code.

On top of that, a `q` parameter exists in that API. In theory we can have a paginated search and search inside that page with `q` parameter, but in my opinion that behavior was too confusing, so I decided to return the results instantly if something was found.

Another approach could be to return paginated results of the items found. In this case, since we didn't have too many elements in the list, the first approach was sufficient.

##POINT 2
In the project now we have 2 kinds of implementation: async/await and promises.
Since this is just a test, I didn't align the two implementations to show how I have worked with both approaches.
In a real environment I prefer to align to only one version for consistency.

#POINT 3
In theory I'm not a big fan of comments because they duplicate the point where a user should make a change, and if some comments are not updated they can be misleading. In theory code should be obvious enough to be self-explanatory and not need any comments.
Since this is a test, I did not delete all the unnecessary comments.

##POINT 4
backend/src/middleware/errorHandler.js did not include any real errorHandler middleware, only malicious code. I've removed it and implemented a new error handler to catch the next() calls inside the catch blocks.

##Additional Notes
- The current implementation uses `item.id = Date.now()` to generate IDs. This is not the best approach because in a real environment it can lead to duplicate IDs if multiple requests happen in the same millisecond. For this test environment, I've kept it this way, but in production a UUID or auto-incrementing ID would be recommended.
- Added Tailwind CSS v3 and implemented minimal styling for the UI to provide a clean interface.