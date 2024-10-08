import { IUser } from '~/models/auth/user/IUser';
import circleFactory from '~/models/connections/circle/factory';
import userProfileFactory from '~/models/auth/user-profile/factory';
import { IUserProfile } from '~/models/auth/user-profile/IUserProfile';
import { ICircle } from '~/models/connections/circle/ICircle';
import { CircleData } from '~/types/models-data/connections/CircleData';
import { DataModel } from '~/models/abstract/DataModel';
import { DataModelAttributeMap } from '~/models/abstract/IDataModel';
import { ModelData } from '~/types/models-data/ModelData';
import {
    dateDeserializer,
    dateSerializer, languageDeserializer, languageSerializer, listDeserializer, listSerializer,
    userProfileDeserializer,
    userProfileSerializer, userVisibilityDeserializer, userVisibilitySerializer
} from '~/models/common/serializers';
import { IPost } from '~/models/posts/post/IPost';
import { ICommunity } from '~/models/communities/community/ICommunity';
import { IPostComment } from '~/models/posts/post-comment/IPostComment';
import { ILanguage } from '~/models/common/language/ILanguage';
import { UserVisibility } from '~/models/auth/user/lib/UserVisibility';
import listFactory from "~/models/lists/list/factory";
import {IList} from "~/models/lists/list/IList";
import {ListData} from "~/types/models-data/lists/ListData";
import {data} from "autoprefixer";

export class User extends DataModel<User> implements IUser {
    uuid!: string;
    areGuidelinesAccepted!: boolean;
    connectionsCircleId!: number;
    followersCount!: number;
    postsCount!: number;
    dateJoined!: Date;
    inviteCount!: number;
    unreadNotificationsCount!: number;
    pendingCommunitiesModeratedObjectsCount!: number;
    activeModerationPenaltiesCount!: number;
    email!: string;
    username!: string;
    followingCount!: number;
    isFollowing!: boolean;
    isFollowed!: boolean;
    isFollowRequested!: boolean;
    isConnected!: boolean;
    isGlobalModerator!: boolean;
    isBlocked!: boolean;
    isReported!: boolean;
    isFullyConnected!: boolean;
    isMemberOfCommunities!: boolean;
    isPendingConnectionConfirmation!: boolean;
    connectedCircles!: ICircle[];
    profile!: IUserProfile;
    language!: ILanguage;
    visibility!: UserVisibility;


    dataMaps: DataModelAttributeMap<IUser>[] = [
        {
            dataKey: 'uuid',
            attributeKey: 'uuid'
        },
        {
            dataKey: 'are_guidelines_accepted',
            attributeKey: 'areGuidelinesAccepted'
        },
        {
            dataKey: 'connections_circle_id',
            attributeKey: 'connectionsCircleId'
        },
        {
            dataKey: 'followers_count',
            attributeKey: 'followersCount'
        },
        {
            dataKey: 'date_joined',
            attributeKey: 'dateJoined',
            deserializer: dateDeserializer,
            serializer: dateSerializer,
        },
        {
            dataKey: 'language',
            attributeKey: 'language',
            deserializer: languageDeserializer,
            serializer: languageSerializer
        },
        {
            dataKey: 'posts_count',
            attributeKey: 'postsCount'
        },
        {
            dataKey: 'invite_count',
            attributeKey: 'inviteCount'
        },
        {
            dataKey: 'visibility',
            attributeKey: 'visibility',
            serializer: userVisibilitySerializer,
            deserializer: userVisibilityDeserializer,
        },
        {
            dataKey: 'unread_notifications_count',
            attributeKey: 'unreadNotificationsCount'
        },
        {
            dataKey: 'pending_communities_moderated_objects_count',
            attributeKey: 'pendingCommunitiesModeratedObjectsCount'
        },
        {
            dataKey: 'active_moderation_penalties_count',
            attributeKey: 'activeModerationPenaltiesCount'
        },
        {
            dataKey: 'email',
            attributeKey: 'email'
        },
        {
            dataKey: 'username',
            attributeKey: 'username'
        },
        {
            dataKey: 'following_count',
            attributeKey: 'followingCount'
        },
        {
            dataKey: 'is_following',
            attributeKey: 'isFollowing',
        },
        {
            dataKey: 'is_follow_requested',
            attributeKey: 'isFollowRequested',
        },
        {
            dataKey: 'is_followed',
            attributeKey: 'isFollowed',
        },
        {
            dataKey: 'is_connected',
            attributeKey: 'isConnected'
        },
        {
            dataKey: 'is_global_moderator',
            attributeKey: 'isGlobalModerator'
        },
        {
            dataKey: 'is_blocked',
            attributeKey: 'isBlocked'
        },
        {
            dataKey: 'is_reported',
            attributeKey: 'isReported'
        },
        {
            dataKey: 'is_follow_requested',
            attributeKey: 'isFollowRequested'
        },
        {
            dataKey: 'is_fully_connected',
            attributeKey: 'isFullyConnected'
        },
        {
            dataKey: 'is_member_of_communities',
            attributeKey: 'isMemberOfCommunities'
        },
        {
            dataKey: 'is_pending_connection_confirmation',
            attributeKey: 'isPendingConnectionConfirmation'
        },
        {
            dataKey: 'profile',
            attributeKey: 'profile',
            deserializer: userProfileDeserializer,
            serializer: userProfileSerializer
        },
        {
            dataKey: 'connected_circles',
            attributeKey: 'connectedCircles',
            deserializer: (instance, rawData: CircleData[]) => {
                if (!rawData) return;
                return rawData.map((rawDataItem) => circleFactory.make(rawDataItem));
            }
        },
        {
            dataKey: 'follow_lists',
            attributeKey: 'followLists',
            deserializer: (instance, rawData: ListData[]) => {
                if (!rawData) return;
                return rawData.map((rawDataItem) => listFactory.make(rawDataItem));
            },
            serializer: listSerializer
        }
    ];

    constructor(data: ModelData) {
        super(data);
        this.updateWithData(data);
    }

    decrementFollowersCount(): void {
        this.followersCount = this.followersCount - 1;
    }

    incrementFollowersCount(): void {
        this.followersCount = this.followersCount + 1;
    }

    canDeletePost(post: IPost): boolean {
        return (post.isCreator(this as any)) || (post.community && post.community.isStaff(this as any));
    }

    canReportPost(post: IPost): boolean {
        return !post.isCreator(this as any);
    }

    canEditPost(post: IPost) {
        return post.isCreator(this as any) && !post.isClosed;
    }

    canCommentPost(post: IPost): boolean {
        if (post.community) {
            if (!post.commentsEnabled) {
                return post.community.isStaff(this as any);
            }
        }

        return true;
    }

    canDeletePostComment(postComment: IPostComment, post: IPost): boolean {
        return (postComment.isCommenter(this as any)) || (post.community && post.community.isStaff(this as any));
    }

    canReportPostComment(postComment: IPostComment, post: IPost): boolean {
        return !postComment.isCommenter(this as any);
    }

    canEditPostComment(postComment: IPostComment): boolean {
        return postComment.isCommenter(this as any);
    }

    canBlockOrUnblockUser(user: IUser): boolean {
        return user && user.id !== this.id;
    }

    canTranslatePost(post: IPost): boolean {
        if ((!post.community && post.isEncircled) ||
            !this.language) return false;

        return post.language && post.language.code != this.language.code;
    }

    canTranslatePostComment(postComment: IPostComment, post: IPost): boolean {
        if ((!post.community && post.isEncircled) ||
            !this.language) return false;

        return postComment.language &&
            postComment.language.code != this.language.code;
    }

    canCloseOrOpenPostInCommunity(community: ICommunity): boolean {
        return community.isAdministrator(this as any) || community.isModerator(this as any);
    }

    canBanOrUnbanUsersInCommunity(community: ICommunity): boolean {
        return community.isAdministrator(this as any) || community.isModerator(this as any);
    }

    isCreatorOfCommunity(community: ICommunity): boolean {
        return community.isCreator;
    }

    canChangeDetailsOfCommunity(community: ICommunity): boolean {
        return community.isAdministrator(this as any);
    }

    canManageCommunityAdministrators(community: ICommunity): boolean {
        return community.canManageAdministrators(this as any);
    }

    canManageCommunityModerators(community: ICommunity): boolean {
        return community.canManageModerators(this as any);
    }

    canEnableOrDisablePostComments(post: IPost): boolean {
        if (post.community) return post.community.canManagePosts(this as any);

        return false;
    }

    canCloseOrOpenPost(post: IPost): boolean {
        if (post.community) return post.community.canManagePosts(this as any);

        return false;
    }

    isCommunityCreator(community: ICommunity): boolean {
        return community.isCreator;
    }

    canReportUser(user: IUser): boolean {
        return !user.isReported;
    }

    followLists: IList[];
}
