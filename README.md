ESLinq
======

***An elegant way of working with iterables***

*ESLinq* aims to be a complete, robust, thoroughly tested port of [Linq to Objects][linq-to-objects]
to ECMAScript 2015 (ES6).

![API Documentation Coverage][https://doc.esdoc.org/github.com/balazsbotond/eslinq/badge.svg]

A first example
---------------

**Problem:** We have an array of users. A user can have multiple email addresses, and not all users
are verified. We need a list of the email addresses of the verified users, and check if all of
them end in ".com".

```javascript
const users = [
	{
		"id": 12,
		"name": "John Smith",
		"emails": ["john.smith@example.com", "jsmith@live.com", "j.s967@gmail.com"],
		"verified": true
	},
	{
		"id": 56,
		"name": "Jennifer Brown",
		"emails": ["jbrown@gmail.com", "jennifer.brown@live.com"],
		"verified": false
	},
	{
		"id": 98,
		"name": "Kate Newton",
		"emails": ["katie6543@yahoo.com", "kate.newton.328@gmail.com"],
		"verified": true
	}
];
```

First, we need to restrict the list to only contain verified users:

```javascript
const verifiedUsers = from(users).where(user => user.verified);
```

Then, we need to get a concatenated list of the email addresses of verified users:

```javascript
const verifiedUserEmails =
    from(users)
	    .where(user => user.verified)
		.selectMany(user => user.emails);
```

```javascript
const allEmailsEndWithCom =
    from(users)
	    .where(user => user.verified)
		.selectMany(user => user.emails)
		.all(email => email.endsWith(".com"));
```

The result is a bool value indicating whether all emails end with the substring ".com".

<!--
    Links
-->

[linq-to-objects]: https://msdn.microsoft.com/en-us/library/bb397919.aspx