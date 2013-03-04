with (scope('Bounty', 'App')) {
  before_filter(require_login);

  route('#issues/:issue_id/bounties/new', function(issue_id) {
    var target_div = div('Loading...');
    render(target_div);

    BountySource.get_issue(issue_id, function(response) {
      var issue = response.data||{};

      render({ into: target_div },
        breadcrumbs(
          a({ href: '#' }, 'Home'),
          a({ href: '#trackers/' + issue.tracker.id }, issue.tracker.name),
          a({ href: '#trackers/' + issue.tracker.id + '/issues' }, 'Issues'),
          '#' + issue_number,
          'Bounties'
        ),

        div({ },
            !issue.closed && !issue.code && section(
              bounty_box(issue)
            )
          ),

          div({ 'class': 'split-end' })
        );
    });
  });

  define('bounty_box', function(issue) {
    return div({ id: 'bounty-box'},

      issue.bounty_total > 0 && section(
        div({ 'class': 'total_bounties' }, money(issue.bounty_total)),
        div({ style: 'text-align: center' }, "From ", issue.bounties.length, " bount" + (issue.bounties.length == 1 ? 'y' : 'ies') + ".")
      ),

      section({ style: 'padding: 21px' },
        form({ action: curry(create_bounty, issue) },

          div({ id: 'create-bounty-errors' }),

          div({ 'class': 'amount' },
            label({ 'for': 'amount-input' }, '$'),
            text({ placeholder: "25", name: 'amount', id: 'amount-input', value: get_params().amount || '' })
          ),

          Payment.payment_methods({ style: 'margin: 10px 0;', value: get_params().payment_method }),

          submit({ 'class': 'blue' }, 'Create Bounty')
        )
      )
    );
  });

  define('create_bounty', function(issue, form_data) {
    var payment_data = {
      amount: form_data.amount,
      payment_method: form_data.payment_method,
      item_number: 'github/' + issue.repository.full_name + '/issues/' + issue.number,
      success_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number + '/bounties/:item_id/receipt',
      cancel_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number,
      postauth_url: window.location.href.split('#')[0] + '#repos/' + issue.repository.full_name + '/issues/' + issue.number + '?payment_method='+form_data.payment_method+'&amount='+form_data.amount
    };

    BountySource.make_payment(payment_data, function(errors) {
      render({ target: 'create-bounty-errors' }, error_message(errors));
    });
  });
}