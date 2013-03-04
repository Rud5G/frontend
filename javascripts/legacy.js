with (scope('App')) {

  // legacy redirects
  route('#repos/:login/:repository/issues/:issue_number/bounties/new', function(login, repository, issue_number) {render('todo')});
  route('#repos/:login/:repository/issues/:issue_number', function(login, repository, issue_number) {render('todo')});
  route('#repos/:login/:repository/issues', function(login, repository) { render('todo') });
  route('#repos/:login/:repository', function(login, repository) { render('todo')});

}

