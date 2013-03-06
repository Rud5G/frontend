with (scope('Solution','App')) {

  define('get_href', function(solution) {
    return '#solutions/'+solution.id;
  });

  define('status_element', function(solution) {
    if (solution.paid_out) {
      return span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Paid Out');
    } else if (solution.accepted) {
      return span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Accepted');
    } else if (solution.disputed) {
      return span({ style: 'background: #F3B13C; border-radius: 4px; padding: 4px; color: white' }, 'Disputed');
    } else if (solution.submitted) {
      return span({ style: 'background: #F3B13C; border-radius: 4px; padding: 4px; color: white' }, 'In Dispute Period');
    } else {
      return span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Started');
    }
  });

  // render status box for solution. states are: pending merge, in dispute period, disputed, accepted.
  define('status_description', function(solution) {
    // dispute period end date is 14 days after the solutions acceptance date
    if (solution.accepted_at) {
      var accepted_at_date    = new Date(solution.accepted_at);
      var dispute_period_ends = new Date(accepted_at_date.getTime() + (14*24*60*60*1000));
    }

    if (solution.accepted && !solution.disputed && !solution.in_dispute_period) {
      return div({ style: 'margin: 5px 0;' },
        small_success_message({ close_button: false, style: 'margin: 5px 0;' }, 'Solution accepted!'),
        a({ 'class': 'green', href: '#solutions/'+solution.id }, 'Claim Bounty!')
      );
    } else if (solution.disputed) {
      return div({ style: 'margin: 5px 0;' },
        error_message({ close_button: false, style: 'margin: 5px 0;' },
          p('Solution has been disputed, and is currently under review.'),
          p('If all outstanding disputes are resolved before ', strong(formatted_date(dispute_period_ends)), ', you will be able to claim the bounty.'),
          ul(
            li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
            li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
          )
        )
      );
    } else if (solution.in_dispute_period) {
      return div({ style: 'margin: 5px 0;' },
        info_message({ close_button: false, style: 'margin: 5px 0;' },
          p('Solution has been merged, but is in the dispute period.'),
          p('If there are no outstanding disputes after ', strong(formatted_date(dispute_period_ends)), ', you will be able to claim the bounty.'),
          ul(
            li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
            li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
          )
        )
      );
    } else if (solution.pull_request && solution.pull_request.merged) {
      return info_message({ style: 'margin: 0;' },
        p("The pull request that you submitted has been merged, but the underlying issue has not yet been closed."),
        p("Your solution will be accepted when your pull request is merged, and the underlying issue is closed."),
        ul(
          li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
          li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
        )
      );
    } else {
      return info_message({ style: 'margin: 0;' },
        p("Your pull request has not yet been merged."),
        p("Your solution will be accepted when your pull request is merged, and the underlying issue is closed."),
        ul(
          li('What does this mean? ', a({ href: '#faq/developers' }, 'More info.')),
          li('Have any questions? Feel free to ', a({ href: 'mailto:support@bountysource.com' }, 'contact support.'))
        )
      );
    }
  });

}