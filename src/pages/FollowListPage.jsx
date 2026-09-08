import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import FollowButton from '../components/FollowButton.jsx'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageShell from '../components/PageShell.jsx'
import { ConversationSkeleton } from '../components/Skeletons.jsx'
import { UsersIcon } from '../components/Icons.jsx'
import { errorMessage, getFollowers, getFollowing } from '../api.js'
import { useT } from '../i18n/index.jsx'
import { listContainer, listItem } from '../motion.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/** Kuzatuvchilar yoki kuzatilganlar ro'yxati. `mode` — 'followers' | 'following'. */
export default function FollowListPage({ mode }) {
  useLogMount('FollowListPage')
  const { userId } = useParams()
  const navigate = useNavigate()
  const t = useT()

  const isFollowers = mode === 'followers'
  const [items, setItems] = useState(null)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      const data = isFollowers ? await getFollowers(userId) : await getFollowing(userId)
      setItems(data)
      log.front(isFollowers ? 'Kuzatuvchilar yuklandi' : 'Kuzatilganlar yuklandi', {
        userId,
        count: data.length,
      })
      setAlert('')
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.front.error("Ro'yxatni yuklab bo'lmadi", err)
      setItems([])
    }
  }, [userId, isFollowers, t])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageShell variant="slide" width="mid">
      <Header
        title={t(isFollowers ? 'profile.followersTitle' : 'profile.followingTitle')}
        backTo={`/profile/${userId}`}
        backLabel={t('common.back')}
      />

      <main className="page page-flush">
        {alert && (
          <div className="alert" style={{ margin: '0 16px 16px' }}>
            {alert}
          </div>
        )}

        {items === null && <ConversationSkeleton count={4} />}

        {items !== null && items.length === 0 && !alert && (
          <EmptyState
            icon={UsersIcon}
            title={t(isFollowers ? 'profile.noFollowers' : 'profile.noFollowing')}
          />
        )}

        {items !== null && items.length > 0 && (
          <motion.div variants={listContainer} initial="initial" animate="animate">
            {items.map((person) => (
              <motion.div key={person.id} className="user-row" variants={listItem}>
                <button
                  type="button"
                  className="user-row-main"
                  onClick={() => navigate(`/profile/${person.id}`)}
                >
                  <Avatar name={person.name} src={person.avatar_url} size={48} />
                  <span className="user-row-body">
                    <span className="user-row-name">{person.name}</span>
                    {person.address && <span className="user-row-sub">{person.address}</span>}
                  </span>
                </button>

                {person.is_me ? (
                  <span className="badge badge-muted">{t('profile.you')}</span>
                ) : (
                  <FollowButton userId={person.id} followed={person.is_followed} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </PageShell>
  )
}
