with (scope('Issue','App')) {

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
