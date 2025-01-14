/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiToolTip } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { NOT_AVAILABLE_LABEL } from '../../../../../common/i18n';
import { ITransactionGroup } from '../../../../../server/lib/transaction_groups/transform';
import { fontFamilyCode, truncate } from '../../../../style/variables';
import { asDecimal, asMillis } from '../../../../utils/formatters';
import { ImpactBar } from '../../../shared/ImpactBar';
import { ITableColumn, ManagedTable } from '../../../shared/ManagedTable';
import { LoadingStatePrompt } from '../../../shared/LoadingStatePrompt';
import { EmptyMessage } from '../../../shared/EmptyMessage';
import { TransactionLink } from '../../../shared/Links/TransactionLink';

const TransactionNameLink = styled(TransactionLink)`
  ${truncate('100%')};
  font-family: ${fontFamilyCode};
`;

interface Props {
  items: ITransactionGroup[];
  serviceName: string;
  isLoading: boolean;
}

export function TransactionList({ items, serviceName, isLoading }: Props) {
  const columns: Array<ITableColumn<ITransactionGroup>> = useMemo(
    () => [
      {
        field: 'name',
        name: i18n.translate('xpack.apm.transactionsTable.nameColumnLabel', {
          defaultMessage: 'Name'
        }),
        width: '50%',
        sortable: true,
        render: (transactionName: string, item: typeof items[0]) => {
          return (
            <EuiToolTip
              id="transaction-name-link-tooltip"
              content={transactionName || NOT_AVAILABLE_LABEL}
            >
              <TransactionNameLink transaction={item.sample}>
                {transactionName || NOT_AVAILABLE_LABEL}
              </TransactionNameLink>
            </EuiToolTip>
          );
        }
      },
      {
        field: 'averageResponseTime',
        name: i18n.translate(
          'xpack.apm.transactionsTable.avgDurationColumnLabel',
          {
            defaultMessage: 'Avg. duration'
          }
        ),
        sortable: true,
        dataType: 'number',
        render: (value: number) => asMillis(value)
      },
      {
        field: 'p95',
        name: i18n.translate(
          'xpack.apm.transactionsTable.95thPercentileColumnLabel',
          {
            defaultMessage: '95th percentile'
          }
        ),
        sortable: true,
        dataType: 'number',
        render: (value: number) => asMillis(value)
      },
      {
        field: 'transactionsPerMinute',
        name: i18n.translate(
          'xpack.apm.transactionsTable.transactionsPerMinuteColumnLabel',
          {
            defaultMessage: 'Trans. per minute'
          }
        ),
        sortable: true,
        dataType: 'number',
        render: (value: number) =>
          `${asDecimal(value)} ${i18n.translate(
            'xpack.apm.transactionsTable.transactionsPerMinuteUnitLabel',
            {
              defaultMessage: 'tpm'
            }
          )}`
      },
      {
        field: 'impact',
        name: i18n.translate('xpack.apm.transactionsTable.impactColumnLabel', {
          defaultMessage: 'Impact'
        }),
        sortable: true,
        dataType: 'number',
        render: (value: number) => <ImpactBar value={value} />
      }
    ],
    [serviceName]
  );

  const noItemsMessage = (
    <EmptyMessage
      heading={i18n.translate('xpack.apm.transactionsTable.notFoundLabel', {
        defaultMessage: 'No transactions were found.'
      })}
    />
  );

  return (
    <ManagedTable
      noItemsMessage={isLoading ? <LoadingStatePrompt /> : noItemsMessage}
      columns={columns}
      items={items}
      initialSortField="impact"
      initialSortDirection="desc"
      initialPageSize={25}
    />
  );
}
