with (scope('Issue','App')) {
  route('#issues/create', function() {
    var target_div = div('Loading...');
    var params = get_params();

    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        "Create New Issue"
      ),
      target_div
    );

    BountySource.try_create_issue(params.url, function(response) {
      var issue = response.data.issue;
      var repository = response.data.repository;
      if(issue) {
        render({ into: target_div },
          div('It looks like this issue already has a $' + issue.bounty_total + ' bounty on it. Would you like to add to the bounty?'),
          div(
            button({ 'class': 'blue', style: 'width: 100px', onClick: curry(set_route, get_href(issue) + '/bounties/new') }, 'Yes'),
            button({ 'class': 'blue', style: 'width: 100px; margin-left: 5px;', onClick: curry(set_route, '#') }, 'No')
          )
        )
      } else if(repository) {
        render({ into: target_div },
          div('The issue is new to us, but we recognize the project as ' + repository.display_name + '. Is that correct?'),
          div(
            button({ 'class': 'blue', style: 'width: 150px', onClick: curry(set_route, '#repos/'+ repository.full_name +'/issues/new?url=' + params.url) }, 'Yes, Add issue'),
            button({ 'class': 'blue', style: 'width: 150px; margin-left: 5px;', onClick: alert("Working in progress ...") }, 'No, Add project')
          )
        )
      } else {
        // TODO
      }
    })
  });

  // get the link for an issue object
  define('get_href', function(issue) {
    return issue.frontend_path;
  });

  // render a pretty 'open' or 'closed' element
  define('status_element', function(issue) {
    return a({ style: 'font-size: 16px; text-decoration: none;', href: get_href(issue) },
      issue.can_add_bounty ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Open') :
                              span({ style: 'background: #D11A1A; border-radius: 4px; padding: 4px; color: white' }, 'Closed')
    );
  });

  define('card', function(issue) {
    issue.image_url       = issue.repository.owner.avatar_url;
    issue.description     = issue.body;
    issue.href            = get_href(issue);
    issue.account_balance = issue.bounty_total;
    return issue_card(issue);
  });
}
