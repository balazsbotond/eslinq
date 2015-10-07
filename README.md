ESLinq
======

***An elegant way of working with iterables***

> **WARNING:** this is a beta version. Feel free to play around with it but don't use it in production.

*ESLinq* aims to be a complete, robust, thoroughly tested port of [Linq to Objects][linq-to-objects]
to ECMAScript 2015 (ES6).

[API Documentation](https://doc.esdoc.org/github.com/balazsbotond/eslinq/)

[![Build Status](https://travis-ci.org/balazsbotond/eslinq.svg?branch=master)](https://travis-ci.org/balazsbotond/eslinq)
[![Code Climate](https://codeclimate.com/github/balazsbotond/eslinq/badges/gpa.svg)](https://codeclimate.com/github/balazsbotond/eslinq)
[![API Documentation Coverage](https://doc.esdoc.org/github.com/balazsbotond/eslinq/badge.svg?pleaseWork)](https://doc.esdoc.org/github.com/balazsbotond/eslinq)

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

It is important to note that `verifiedUserEmails` is a *lazily evaluated iterable*: filtering
and transformation is only done once we start iterating it, e. g. with a `for..of` loop:

```javascript
for (let email of verifiedUserEmails) {
	// The first time this loop executes is the first time the original iterable is read from.
	// Filtering (`where`) and transformation (`selectMany`) run element-by-element during iteration.
	console.log(email);
}
```

Now let's check if all emails end with ".com":

```javascript
const allEmailsEndWithCom =
    from(users)
	    .where(user => user.verified)
		.selectMany(user => user.emails)
		.all(email => email.endsWith(".com"));
```

The result is a bool value indicating whether all emails end with the substring ".com". The `all`
operator is an *eager* one: it iterates through all elements to compute its value.

<!--
    Links
-->

[linq-to-objects]: https://msdn.microsoft.com/en-us/library/bb397919.aspx
